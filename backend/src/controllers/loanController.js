import loanService from '../services/loanService.js';

const sendResponse = (res, data) => {
    res.status(200).json({ status: 'success', data });
};

export const submitApplication = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await loanService.submitApplication(userId, req.body);
        sendResponse(res, result);
    } catch (error) {
        next(error);
    }
};

export const getStatus = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await loanService.getApplicationStatus(userId);
        if (!result) return res.status(404).json({ status: 'error', message: 'No application found' });
        sendResponse(res, result);
    } catch (error) {
        next(error);
    }
};

export default {
    submitApplication,
    getStatus
};
