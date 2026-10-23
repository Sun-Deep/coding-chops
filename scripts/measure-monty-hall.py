"""Monty Hall, played 10,000 times.

Three doors, a car behind one and a goat behind each of the others. You
take door 1. The host, who knows where the car is, opens one of the other
two doors and always shows a goat; when your door is the car he has two
goats to choose from and picks one at random. Then you either stick with
door 1 or switch to the door that is left.

Every game is played once and scored both ways, so stick and switch see
exactly the same cars. The loop below is the one shown in the reel,
line for line. Seeded, so the same games come out every run; nothing is
timed.

Printed: the counts after 10,000 games, the running counts the reel's
tallies show, the first 300 games the reel draws, the three cases worked
out exactly, and a check against src/vertical/45-monty-hall/measurements.ts.

Usage: python3 scripts/measure-monty-hall.py
"""

import json
import platform
import random
import re
import sys
from pathlib import Path

GAMES = 10_000
SEED = 45
SHOWN = 300


def host_opens(car, pick):
    """A door that is not yours and not the car: always a goat."""
    goats = [door for door in range(3) if door != pick and door != car]
    return random.choice(goats)


def play():
    random.seed(SEED)
    stick = switch = 0
    running = []
    games = []
    # -- the reel shows from here
    for game in range(10_000):
        car = random.randrange(3)  # the prize
        pick = 0  # you take door 1
        opened = host_opens(car, pick)  # always a goat
        other = 3 - pick - opened  # the door left
        stick += car == pick
        switch += car == other
    # -- to here
        games.append((car, opened))
        if (game + 1) % 100 == 0:
            running.append((stick, switch))
    return stick, switch, running, games


def exact():
    """The three places the car can be, each a third of the time."""
    stick = switch = 0
    for car in range(3):
        pick = 0
        goats = [d for d in range(3) if d != pick and d != car]
        for opened in goats:
            share = 1 / 3 / len(goats)
            other = 3 - pick - opened
            stick += share * (car == pick)
            switch += share * (car == other)
    return stick, switch


stick, switch, running, games = play()
assert stick + switch == GAMES, "every game is won one way or the other"
shown = games[:SHOWN]
cars = "".join(str(c + 1) for c, _ in shown)
opened = "".join(str(o + 1) for _, o in shown)
ex_stick, ex_switch = exact()

print("== versions")
print(f"Python {platform.python_version()}")
print()
print(f"== {GAMES:,} games, seed {SEED}, you always take door 1")
print(f"stick wins:  {stick:,}  ({stick / GAMES:.1%})")
print(f"switch wins: {switch:,}  ({switch / GAMES:.1%})")
print()
print("== exactly")
print(f"stick {ex_stick:.4f}, switch {ex_switch:.4f}")
print()
print("== running counts every 100 games (stick, switch)")
print(" ".join(f"{a}/{b}" for a, b in running))
print()
print(f"== the first {SHOWN} games: the car's door, then the door the host opened")
print(cars)
print(opened)
first_stick = sum(c == 0 for c, _ in shown)
print(f"of these, stick wins {first_stick}, switch wins {SHOWN - first_stick}")

run = {
    "games": GAMES,
    "stick": stick,
    "switch": switch,
    "shownStick": first_stick,
    "cars": cars,
    "opened": opened,
    "running": [list(r) for r in running],
}

src = Path(__file__).resolve().parent.parent / "src/vertical/45-monty-hall/measurements.ts"
text = src.read_text()
m = re.search(r"export const RUN = (\{.*?\n\});", text, re.S)
want = None
if m:
    body = re.sub(r"//.*", "", m.group(1))
    body = re.sub(r"/\*.*?\*/", "", body, flags=re.S)
    body = re.sub(r"(\w+):", r'"\1":', body)
    body = re.sub(r",(\s*[}\]])", r"\1", body)
    body = body.replace("_", "")
    try:
        want = json.loads(body)
    except json.JSONDecodeError:
        want = None
# The loop on screen has to be the loop that ran.
code = re.findall(r'"((?:[^"\\]|\\.)*)"', re.search(r"export const CODE = \[(.*?)\]", text, re.S).group(1))
mine = Path(__file__).read_text().split("\n")
start = mine.index("    # -- the reel shows from here") + 1
end = mine.index("    # -- to here")
loop = [line[4:] for line in mine[start:end]]
print()
if code != loop:
    print("== MISMATCH: CODE in measurements.ts is not the loop in this script")
    print(json.dumps(loop, indent=1))
    sys.exit(1)
if want != run:
    print("== MISMATCH with measurements.ts")
    print(json.dumps(run))
    sys.exit(1)
print("== measurements.ts matches this run")
