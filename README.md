# Daily Timelog 0.1.0 (Alpha)

Basic IntelliSense and tools for planning Tasks and keeping a daily time log.

*This is a very eraly alpha version! Expect Bugs, inefficient Code and more goodies.*

## Usage

After installing the extension, it will offer basic IntelliSense for file of the format:

```glob
*.daylog.yml
```

It also offers some commands, the only ones implemented for now are `Daily Timelog: Generate Task List` and `Daily Timelog: Generate Summary`

## Intellisense

You can use intelliSense to find out more, but the basic file structure is:

```yaml
date: 2021-02-03
plannedTasks:
  - Task 1: 1h 45m
  - Task 2: 7h 15m
  - Task 3: 15m
  - Checking Mails: 1h 15m
timeLog:
  - "08:00": START WORK (This line must always be present)
  - "08:45": Task 1
  - "09:00": Daily
  - "10:30": Task 2
  - "12:00": Task 1
  - "13:00": BREAK (Breaks are in the works)
  - "14:45": Task 3
  - "17:00": Extra Task
```

IntelliSense should offer you reasonably good predictions of durations, times and task names. It keeps ttrack of the task names used in the `plannedTasks` section as well as the tasks already listed in the `timeLog` section.

## Commands

`Daily Timelog: Generate Task List` will generate a human-readable list of your planned Tasks for the active file. The result will be put into your clipboard - ready to paste. Customization is already half-implemented.

`Daily Timelog: Generate Summary` will generate a list of your completed tasks inlcunding ones that weren't planned. Same deal as `Generate Task List`.