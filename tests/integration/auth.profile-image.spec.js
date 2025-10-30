import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  vi,
} from "vitest";
import supertest from "supertest";
import { PassThrough } from "stream";
import { AuthService } from "../../src/services/auth.service.js";
import { UserModel } from "../../src/models/user.model.js";
import {
  setupTestApplication,
  teardownTestApplication,
  resetDatabase,
} from "../utils/test-app.js";

// Mock Cloudinary using vi.mock with factory
vi.mock("cloudinary", () => {
  const mockV2 = {
    config: vi.fn(),
    uploader: {
      upload_stream: vi.fn((options, callback) => {
        const stream = new PassThrough();

        stream.on("finish", () => {
          callback(null, {
            secure_url:
              "https://res.cloudinary.com/test-cloud/image/upload/test-image.png",
          });
        });

        stream.on("error", (error) => {
          callback(error);
        });

        return stream;
      }),
    },
  };

  return {
    v2: mockV2,
    default: { v2: mockV2 },
  };
});

// Generate a small valid PNG buffer for testing
// This is more reliable than reading from disk and works in CI
const createTestImageBuffer = () => {
  // Simple 1x1 transparent PNG
  const buffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==",
    "base64"
  );
  return buffer;
};

describe("Profile image upload flow", () => {
  let app;
  let request;

  beforeAll(async () => {
    const setup = await setupTestApplication();
    app = setup.app;
    request = supertest(app);
  }, 60_000);

  beforeEach(async () => {
    await resetDatabase();
    vi.spyOn(AuthService.prototype, "updateProfileImage").mockImplementation(
      async (userId) => {
        const user = await UserModel.findById(userId);
        const profileImageUrl = "https://res.cloudinary.com/test/image/upload/profile.png";

        if (user) {
          user.profileImageUrl = profileImageUrl;
          await user.save();
        }

        return {
          user,
          profileImageUrl,
        };
      }
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await teardownTestApplication();
  });

  const registerUser = async () => {
    const email = `test.user.${Date.now()}@example.com`;
    const password = "Test123!@#";

    const response = await request.post("/api/v1/auth/register").send({
      fullName: "Test User",
      email,
      password,
      phoneNumber: "+2348012345678",
    });

    expect(response.status, JSON.stringify(response.body)).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user).toBeDefined();
    expect(response.body.data.tokens.accessToken).toBeDefined();

    return {
      user: response.body.data.user,
      email,
      password,
      accessToken: response.body.data.tokens.accessToken,
    };
  };

  const loginUser = async (email, password) => {
    const response = await request.post("/api/v1/auth/login").send({
      email,
      password,
    });

    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.tokens.accessToken).toBeDefined();

    return response.body.data.tokens.accessToken;
  };

  it("completes the register → login → upload profile image flow", async () => {
    // Register a new user
    const { user: newUser, email, password } = await registerUser();
    expect(newUser.profileImageUrl).toBeNull();

    // Login to get a fresh token
    const accessToken = await loginUser(email, password);

    // Upload a profile image
    const imageBuffer = createTestImageBuffer();
    const uploadResponse = await request
      .post("/api/v1/auth/profile-image")
      .set("Authorization", `Bearer ${accessToken}`)
      .attach("profileImage", imageBuffer, "test-image.png");

    expect(uploadResponse.status, JSON.stringify(uploadResponse.body)).toBe(
      200
    );
    expect(uploadResponse.body.success).toBe(true);
    expect(uploadResponse.body.data.user.profileImageUrl).toBeDefined();
    expect(uploadResponse.body.data.profileImageUrl).toBeDefined();
    expect(typeof uploadResponse.body.data.profileImageUrl).toBe("string");
  });

  it("rejects image upload without authentication", async () => {
    const imageBuffer = createTestImageBuffer();
    const response = await request
      .post("/api/v1/auth/profile-image")
      .attach("profileImage", imageBuffer, "test-image.png");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("rejects invalid file types", async () => {
    const { accessToken } = await registerUser();

    // Create a fake "text file"
    const textBuffer = Buffer.from("This is not an image", "utf-8");
    const response = await request
      .post("/api/v1/auth/profile-image")
      .set("Authorization", `Bearer ${accessToken}`)
      .attach("profileImage", textBuffer, "not-an-image.txt");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("BAD_REQUEST");
    expect(response.body.error.message).toMatch(/invalid file type/i);
  });

  it("rejects oversized files", async () => {
    const { accessToken } = await registerUser();

    // Create a buffer larger than 5MB
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024);
    const response = await request
      .post("/api/v1/auth/profile-image")
      .set("Authorization", `Bearer ${accessToken}`)
      .attach("profileImage", largeBuffer, "too-large.png");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("BAD_REQUEST");
    expect(response.body.error.message).toMatch(/too large/i);
  });

  it("rejects requests without a file", async () => {
    const { accessToken } = await registerUser();

    const response = await request
      .post("/api/v1/auth/profile-image")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("BAD_REQUEST");
    expect(response.body.error.message).toMatch(/no file/i);
  });
});
