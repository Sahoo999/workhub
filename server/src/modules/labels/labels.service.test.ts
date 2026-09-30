import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { AppError } from "../../utils/app-error.js";

import * as labelsRepository from "./labels.repository.js";

import {
  createLabel,
  addLabelToTask,
  removeLabelFromTask,
} from "./labels.service.js";

vi.mock("./labels.repository.js", () => ({
  createLabel: vi.fn(),
  findLabelById: vi.fn(),
  listLabelsByWorkspace: vi.fn(),
  addLabelToTask: vi.fn(),
  removeLabelFromTask: vi.fn(),
  listTaskLabels: vi.fn(),
}));

describe("labels.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createLabel", () => {
    it("creates a valid label", async () => {
      vi.mocked(
        labelsRepository.createLabel,
      ).mockResolvedValue({
        id: "label-1",
        workspace_id: "workspace-1",
        name: "Bug",
        color: "#ef4444",
        created_at: new Date(),
      });

      const result = await createLabel(
        {
          name: "Bug",
          color: "#ef4444",
        },
        "workspace-1",
      );

      expect(result).toEqual({
        id: "label-1",
        workspace_id: "workspace-1",
        name: "Bug",
        color: "#ef4444",
        created_at: expect.any(Date),
      });

      expect(
        labelsRepository.createLabel,
      ).toHaveBeenCalledWith(
        "workspace-1",
        "Bug",
        "#ef4444",
      );
    });

    it("converts a duplicate label into a 409 AppError", async () => {
      vi.mocked(
        labelsRepository.createLabel,
      ).mockRejectedValue({
        code: "23505",
      });

      const error = await createLabel(
  {
    name: "Bug",
  },
  "workspace-1",
).catch((error: unknown) => error);

expect(error).toBeInstanceOf(AppError);
expect((error as AppError).statusCode).toBe(409);
expect((error as AppError).code).toBe(
  "LABEL_ALREADY_EXISTS",
);
expect((error as AppError).message).toBe(
  "A label with this name already exists",
);
    });

    it("rejects an invalid label name", async () => {
      await expect(
        createLabel(
          {
            name: "",
          },
          "workspace-1",
        ),
      ).rejects.toThrow();

      expect(
        labelsRepository.createLabel,
      ).not.toHaveBeenCalled();
    });
  });

  describe("addLabelToTask", () => {
    it("adds a label belonging to the workspace", async () => {
      vi.mocked(
        labelsRepository.findLabelById,
      ).mockResolvedValue({
        id: "label-1",
        workspace_id: "workspace-1",
        name: "Bug",
        color: "#ef4444",
        created_at: new Date(),
      });

      vi.mocked(
        labelsRepository.addLabelToTask,
      ).mockResolvedValue();

      await addLabelToTask(
        "task-1",
        "label-1",
        "workspace-1",
      );

      expect(
        labelsRepository.findLabelById,
      ).toHaveBeenCalledWith(
        "label-1",
      );

      expect(
        labelsRepository.addLabelToTask,
      ).toHaveBeenCalledWith(
        "task-1",
        "label-1",
      );
    });

    it("rejects a label from another workspace", async () => {
      vi.mocked(
        labelsRepository.findLabelById,
      ).mockResolvedValue({
        id: "label-1",
        workspace_id: "workspace-2",
        name: "Bug",
        color: "#ef4444",
        created_at: new Date(),
      });

      const error = await addLabelToTask(
  "task-1",
  "label-1",
  "workspace-1",
).catch((error: unknown) => error);

expect(error).toBeInstanceOf(AppError);
expect((error as AppError).statusCode).toBe(403);
expect((error as AppError).code).toBe(
  "LABEL_WORKSPACE_MISMATCH",
);

      expect(
        labelsRepository.addLabelToTask,
      ).not.toHaveBeenCalled();
    });

    it("rejects a missing label", async () => {
      vi.mocked(
        labelsRepository.findLabelById,
      ).mockResolvedValue(null);

      const error = await addLabelToTask(
  "task-1",
  "label-1",
  "workspace-1",
).catch((error: unknown) => error);

expect(error).toBeInstanceOf(AppError);
expect((error as AppError).statusCode).toBe(404);
expect((error as AppError).code).toBe(
  "LABEL_NOT_FOUND",
);

      expect(
        labelsRepository.addLabelToTask,
      ).not.toHaveBeenCalled();
    });
  });

  describe("removeLabelFromTask", () => {
    it("removes a label belonging to the workspace", async () => {
      vi.mocked(
        labelsRepository.findLabelById,
      ).mockResolvedValue({
        id: "label-1",
        workspace_id: "workspace-1",
        name: "Bug",
        color: "#ef4444",
        created_at: new Date(),
      });

      vi.mocked(
        labelsRepository.removeLabelFromTask,
      ).mockResolvedValue();

      await removeLabelFromTask(
        "task-1",
        "label-1",
        "workspace-1",
      );

      expect(
        labelsRepository.removeLabelFromTask,
      ).toHaveBeenCalledWith(
        "task-1",
        "label-1",
      );
    });
  });
});