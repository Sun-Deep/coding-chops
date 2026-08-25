# Episode 01: How a Web Application Works on One Server

Status: published

Both gates passed before release. The understanding check is complete, and the
finished render was watched from beginning to end.

## Learning objective

After the lesson, a beginner should be able to trace one request from a client to an application server, into persistent storage, and back as a response.

## Scope

This lesson introduces a minimal mental model:

```text
Client -> Application server -> Database -> Application server -> Client
```

It does not attempt to teach DNS, TCP, TLS, load balancing, caching, replication, or sharding.

## Files

- `learning-notes.md`: research questions and evolving explanation
- `sources.md`: authoritative references used by the lesson
- `understanding-check.md`: creator comprehension gate
- `script.md`: the recorded narration, approved once the understanding check passes
- `storyboard.md`: visual plan, not approved narration
- `affiliate-slot.md`: the paid segment for this episode, its disclosure copy, and its link

## Published as

| Field    | Value                                                        |
| -------- | ------------------------------------------------------------ |
| Title    | How One Server Runs a Web App \| System Design for Beginners |
| Playlist | System Design for Beginners                                  |
| Category | Education, concept overview, beginner                        |
| Runtime  | 8:36                                                         |
| Language | English (United States)                                      |

The description and the pinned comment are in `affiliate-slot.md`, because both
carry the affiliate link and the standard keeps links in one file per episode.

Subtitles are burned into the frame. A caption file goes up alongside the video
anyway, or YouTube generates its own and a viewer with captions on sees two sets
at once. Build it with `node scripts/build-srt.mjs system-design/01-single-server`.

### Playlist description

```text
You can memorise what a load balancer is in about a minute. Knowing when you actually need one takes longer, and that is the part most explainers skip.

This series starts with a single request on a single server, then adds a piece only once you can see the problem it fixes. Each lesson answers the question the last one left you with.

The animations are code. All of it is open: https://github.com/Sun-Deep/coding-chops
```

### Questions answered, for YouTube's education metadata

Timecodes are measured from the caption JSON, so each lands on the sentence that
answers it. Nothing falls between 5:47 and 6:17: that is the affiliate segment
and it answers no learner question.

```text
0:30 What is a server?
0:47 Does "server" mean the machine or the program running on it?
1:04 What is a process?
1:17 Why does a web app need a database at all?
1:32 What is persistent storage?
1:49 What is a client?
2:21 What happens to a request after it reaches the server?
2:44 Why do web applications send data as JSON?
3:12 What resources does a single request use?
3:32 What is storage I/O?
3:49 Why do some requests cost more than others?
4:04 Why doesn't user count tell you if one server is enough?
4:49 Why does an app get slow before it crashes?
5:16 What happens when a server runs out of memory?
6:21 What is vertical scaling?
6:54 Do backups keep an application online?
7:07 What happens if I move the database to its own machine?
```
