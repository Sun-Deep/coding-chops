# Learning notes

Status: incomplete

## The minimal model

A user interacts with a client, such as a browser or mobile application. The client sends a request to an application. The application performs work, may read or write persistent data, and returns a response.

In the first lesson, one machine may host the application and database for simplicity. That is a learning model, not a universal production recommendation.

## Questions that must be answered before scripting

- What is a client?
- What is a server process compared with a physical or virtual machine?
- What information belongs in a request and response at this level of abstraction?
- Which work consumes CPU, memory, disk I/O, and network capacity?
- What data disappears when a process stops?
- Why does persistent storage exist?
- Which simplifications should be stated explicitly?

## Important correction

“10,000 users” is not a meaningful capacity limit by itself. Capacity depends on request rate, concurrency, work per request, data size, and resource use.
