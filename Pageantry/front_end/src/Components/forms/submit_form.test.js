import { SubmitForm } from './submit_form';

// Mocking fetch
global.fetch = jest.fn();

// Mocking window.location.replace
Object.defineProperty(window, 'location', {
  value: {
    replace: jest.fn(),
  },
  writable: true,
});

describe('SubmitForm', () => {
  beforeEach(() => {
    fetch.mockClear();
    window.location.replace.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should handle timeout correctly', async () => {
    const setState = jest.fn();
    const setButton = jest.fn();

    fetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              json: () => Promise.resolve({ code: 'success' }),
            });
          }, 31000); // Simulate a response after 31 seconds
        })
    );

    const e = {
      preventDefault: jest.fn(),
      target: {
        querySelectorAll: jest.fn().mockReturnValue([]),
      },
    };

    const submitPromise = SubmitForm({
      e,
      name: 'login',
      setState,
      setButton,
    });

    // Fast-forward time by 30 seconds to trigger the timeout
    jest.advanceTimersByTime(30000);

    await submitPromise;

    expect(setButton).toHaveBeenCalledWith({ is_submitting_data: true });
    expect(setState).toHaveBeenCalledWith({
      type: 'error',
      code: 'timeout',
      statusText: ['The request timed out. Please try again.'],
    });
    expect(setButton).toHaveBeenCalledWith({ is_submitting_data: false });
  });
});
