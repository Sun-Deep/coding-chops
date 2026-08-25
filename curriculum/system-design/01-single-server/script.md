# Script: How a web application works on one server

Status: approved

The narration below is what was recorded, and the captions in `audio/captions`
are transcribed from it, so it is the text every animation is timed against.

Approved means the understanding check beside this file passes. It says nothing
about whether the video has been published, and nothing about the production
gate, which is a person watching the finished render from beginning to end.

Timing headings are the storyboard's provisional plan. The timing that actually
governs the video comes from the caption JSON, which is measured from the locked
recording. Where the two disagree, the captions win.

Section headings map one to one onto the scene compositions in
`src/tracks/system-design/01-single-server`.

## 01. Start with one request (00:00 to 00:50)

System design often gets introduced as a pile of tools: load balancers, caches, queues, microservices.

Ignore those for a moment. To understand the system, start with one request.

Imagine you built a photo app. Someone opens it to see new photos from people they follow. The phone sends a message asking for those photos. A computer receives the message, runs your code, finds the data, and sends a reply.

That computer is a server.

For a small app, one server may be enough. Let's follow a single request through it before we decide what else the system needs.

## 02. What one server means (00:50 to 02:05)

First, we need to clear up one confusing word.

Server can mean a machine. It can also mean a program that runs on that machine and waits for requests.

Here, a one-server setup means one machine running two programs.

One is the application process. This is your code while it is running. A process is simply a running program.

The other is the database. It keeps user accounts, photo details, and the information needed to choose which photos each person sees.

Why use a database at all? Because the application process can stop or restart. Anything stored only in its memory disappears when that happens.

The database stores information that must survive a restart. We call this persistent storage.

Both programs run on the same machine in our example. We chose this setup so the request path stays easy to see. Many real applications put them on separate machines.

## 03. Follow the request there and back (02:05 to 03:40)

Back to the photo app.

The software on the phone is the client. A client sends a request and uses the response that comes back.

We will assume the phone already knows where to send the request. That lets us focus on what happens inside this one-server setup.

The request reaches the machine, and the application process reads it. It might say, "Give me the first ten photos for this user." It also tells the application what to do and which signed-in user asked for it.

The application checks the request, then asks the database for the matching photos.

The database may find the data in memory, or it may read from persistent storage. It sends the matching records back to the application.

The application builds a response. A response contains the requested data or explains why the request failed. Web applications often send this data in a structured format called JSON.

The phone receives the response and displays the photos.

That is the full trip. The request went from the client to the application, into the database, back through the application, and back to the client.

## 04. What the server spends (03:40 to 05:20)

One tap on the screen created work across the machine. Each step used a limited resource.

The application used CPU time to check the request, run its logic, and build the response. The CPU executes the program's instructions.

The application and database used memory, often called RAM, to hold working data while the request was active.

The database may also read from or write to storage. We call that work storage input and output, or storage I/O. Keeping recently used data in memory can avoid some storage reads, but memory has a limit too.

The request and response also used network capacity as they moved between the phone and server.

Requests do not cost the same. Returning ten photo captions is light work. Resizing a large photo can keep the CPU busy much longer. A database query may spend most of its time waiting for storage.

This is why "ten thousand users" does not tell us whether one server is enough. Ten thousand accounts may be easy to support if few people open the app. A few hundred people can be hard to support if they upload and resize photos at the same time.

Capacity depends on the requests. How many arrive each second? How many run at once? How much work does each one require? How much data comes back? How long will the user wait?

## 05. When requests begin to wait (05:20 to 06:45)

Now more people open the app at once. The same kind of photo request reaches the server again and again.

As long as the server completes requests as fast as they arrive, the photos appear on time. Once requests arrive faster than the server can finish them, they form a line.

The line grows. Photos take longer to appear. Some requests wait past their time limit, so the client shows a timeout or an error.

The cause depends on the workload. The CPU may be busy running application code. The database may be waiting on storage. The network may be carrying as much data as it can handle.

Running out of memory causes a different failure. The operating system may kill a process to recover memory. New requests fail until the application restarts. Data held only inside that process disappears. If the database and its storage stay healthy, the persistent data remains.

Servers also go down because of bugs, hardware failures, power loss, and failed dependencies. Hitting a resource limit is one cause of an outage. It is not the definition of a crash.

## 05b. Affiliate disclosure (06:45 to 07:07)

Quick disclosure before we fix this.

The DigitalOcean link in the description is an affiliate link. If you sign up through it, I earn a commission and it costs you nothing extra. Nobody there paid for this video or read the script.

A Droplet is one virtual machine, rented by the hour. It runs the application process and the database side by side, exactly the setup we just drew.

Which matters, because of what we are about to do to it.

## 06. The first scaling decisions (07:07 to 08:52)

If monitoring shows that the machine is short on resources, the simplest fix may be a larger machine.

Moving the setup to a machine with more CPU, more memory, faster storage, or more network capacity is called vertical scaling. Engineers also call it scaling up.

Scaling up buys more room without changing the request path. It is often the right first move.

But every machine has a ceiling. Large machines get expensive, and maintenance or failure still takes the whole application offline. The machine remains a single point of failure.

Backups do not change that. A backup lets you restore data later. It does not serve requests while the machine is down.

Now suppose monitoring shows that the application and database are competing for resources. You could move the database to its own machine.

Each workload now has its own CPU, memory, and storage. You can scale the application and database separately.

The separation adds a network call between them. You also have two machines to configure, monitor, and protect. Either machine can still fail.

Moving the database reduces resource contention and lets the two workloads scale independently. It does not keep the application online when either machine fails. That problem needs a different design.

## 07. The question before the diagram (08:52 to 09:57)

So, is one server enough for your application?

Maybe. Plenty of applications run well on one machine. The answer depends on the workload.

Before drawing boxes, ask what people will do, how many requests arrive, how much data moves, how fast the response must be, and what the application should do when something fails.

Those answers come before the architecture diagram.

In the next video, we'll turn a rough product idea into technical requirements. We will use those requirements to decide whether one server is enough and what to change first.

You should now be able to trace one request from the phone, through the application and database, and back again.

The animation code for this video is in the repository linked below.

If this cleared up the request path, like the video. Share it with someone learning system design, and subscribe for the next one.

### Horizontal outro screen

Production note, not narration:

- Channel logo
- `One request. Full path.`
- `Like · Share · Subscribe`
- Keep the logo and text on the warm paper canvas.
- Hold the screen long enough for the complete call to action.
