const scheduleWorker = require('../src/workers/scheduleWorker');
const scheduleModel = require('../src/models/scheduleModel');
const postService = require('../src/services/postService');

jest.mock('../src/models/scheduleModel');
jest.mock('../src/services/postService');

describe('ScheduleWorker', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should process pending schedules and update statuses to completed', async () => {
        const mockSchedules = [
            { id: 1, post_id: 101, status: 'processing' },
            { id: 2, post_id: 102, status: 'processing' }
        ];

        scheduleModel.getAndLockPendingSchedules.mockResolvedValue(mockSchedules);
        postService.publishPost.mockResolvedValue({ id: 101, status: 'posted' });
        scheduleModel.updateStatus.mockResolvedValue(true);

        await scheduleWorker.processSchedules();

        expect(scheduleModel.getAndLockPendingSchedules).toHaveBeenCalledTimes(1);

        expect(postService.publishPost).toHaveBeenCalledTimes(2);
        expect(postService.publishPost).toHaveBeenCalledWith(101);
        expect(postService.publishPost).toHaveBeenCalledWith(102);

        expect(scheduleModel.updateStatus).toHaveBeenCalledTimes(2);
        expect(scheduleModel.updateStatus).toHaveBeenCalledWith(1, 'completed');
        expect(scheduleModel.updateStatus).toHaveBeenCalledWith(2, 'completed');
    });

    it('should update schedule status to failed if publishing fails', async () => {
        const mockSchedules = [
            { id: 1, post_id: 101, status: 'processing' }
        ];

        scheduleModel.getAndLockPendingSchedules.mockResolvedValue(mockSchedules);
        postService.publishPost.mockRejectedValue(new Error('API failure'));
        scheduleModel.updateStatus.mockResolvedValue(true);

        await scheduleWorker.processSchedules();

        expect(postService.publishPost).toHaveBeenCalledWith(101);
        expect(scheduleModel.updateStatus).toHaveBeenCalledWith(1, 'failed');
    });

    it('should do nothing if no pending schedules are found', async () => {
        scheduleModel.getAndLockPendingSchedules.mockResolvedValue([]);

        await scheduleWorker.processSchedules();

        expect(scheduleModel.getAndLockPendingSchedules).toHaveBeenCalledTimes(1);
        expect(postService.publishPost).not.toHaveBeenCalled();
        expect(scheduleModel.updateStatus).not.toHaveBeenCalled();
    });
});
