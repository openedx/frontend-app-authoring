import { startLinkCheck, fetchLinkCheckStatus } from "./thunks";
import * as api from "./api";
import { LINK_CHECK_STATUSES } from "./constants";
import { RequestStatus } from "../../data/constants";

describe("startLinkCheck thunk", () => {
  const dispatch = jest.fn();
  const getState = jest.fn();
  const courseId = "course-123";
  let mockGetStartLinkCheck;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGetStartLinkCheck = jest.spyOn(api, "postLinkCheck").mockResolvedValue({
      linkCheckStatus: LINK_CHECK_STATUSES.IN_PROGRESS,
    });
  });

  describe("successful request", () => {
    it("should set link check stage and request statuses to their in-progress states", async () => {
      const inProgressStageId = 1;
      await startLinkCheck(courseId)(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        payload: { status: RequestStatus.PENDING },
        type: "courseOptimizer/updateSavingStatus",
      });

      expect(dispatch).toHaveBeenCalledWith({
        payload: true,
        type: "courseOptimizer/updateLinkCheckInProgress",
      });

      expect(dispatch).toHaveBeenCalledWith({
        payload: { status: RequestStatus.SUCCESSFUL },
        type: "courseOptimizer/updateSavingStatus",
      });

      expect(
        dispatch.mock.calls.filter(
          (call) =>
            call[0].type === "courseOptimizer/updateCurrentStage" &&
            call[0].payload === inProgressStageId
        ).length
      ).toBe(2);
    });
  });

  describe("failed request should set stage and request ", () => {
    it("should set request status to failed", async () => {
      const failureStageId = -1;
      mockGetStartLinkCheck.mockRejectedValue(new Error("error"));

      await startLinkCheck(courseId)(dispatch, getState);

      expect(dispatch).toHaveBeenCalledWith({
        payload: { status: RequestStatus.FAILED },
        type: "courseOptimizer/updateSavingStatus",
      });
      expect(dispatch).toHaveBeenCalledWith({
        payload: false,
        type: "courseOptimizer/updateLinkCheckInProgress",
      });
      expect(dispatch).toHaveBeenCalledWith({
        payload: -1,
        type: "courseOptimizer/updateCurrentStage",
      });
    });
  });
});
