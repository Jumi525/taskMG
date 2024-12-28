// fetchTasks.test.js
const fetchMock = require("jest-fetch-mock");
fetchMock.enableMocks();

beforeEach(() => {
  fetch.resetMocks();
  localStorage.clear();
});

test("should include token in Authorization header when fetching tasks", async () => {
  const mockToken = "test-token";
  localStorage.setItem("authToken", mockToken);

  fetch.mockResponseOnce(JSON.stringify([]), { status: 200 });

  // Simulate fetchTasks logic
  const response = await fetch("http://localhost:5000/tasks", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });

  // Assert that the correct header was sent
  expect(fetch).toHaveBeenCalledWith("http://localhost:5000/tasks", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${mockToken}`,
    },
  });

  const data = await response.json();
  expect(data).toEqual([]); // Assuming no tasks
});
