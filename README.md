# Daily Timelog 0.0.12 (Alpha)

Basic IntelliSense and tools for planning Tasks and keeping a daily time log.

*This is a very early alpha version! Expect bugs, inefficient code and more goodies.*

## Usage

After installing the extension, it will offer basic IntelliSense for file of the format:

```glob
*.daylog.yml
```

It also offers some commands, the only ones implemented for now are `Daily Timelog: Generate Task List` and `Daily Timelog: Generate Summary`

## Intellisense

You can use intelliSense to rfind out more, but the basic file structure is:

```yaml
date: 2021-02-03
plannedTasks:
  - Task 1: 1h 45m
  - Task 2: 7h 15m
  - Task 3: 15m
  - Checking Mails: 1h 15m
  - You can also use the !break tag in this section: !break 1h
timeLog:
  - "08:00": !begin Let's Start! (This line must always be present)
  - "08:45": Task 1
  - "09:00": Daily
  - "10:30": Task 2
  - "12:00": Task 1
  - "13:00": !break use the !break tag for breaks
  - "14:45": Task 3
  - "17:00": Extra Task
```

IntelliSense should offer you reasonably good predictions of durations, times and task names. It keeps track of the task names used in the `plannedTasks` section as well as the tasks already listed in the `timeLog` section.

## Commands

`Daily Timelog: Generate Task List` will generate a human-readable list of your planned Tasks for the active file. The result will be put into your clipboard - ready to paste. Customization is already half-implemented.

`Daily Timelog: Generate Summary` will generate a list of your completed tasks including ones that weren't planned. Same deal as `Generate Task List`.

## Settings

The extension offers a variety of settings. The most important ones configure the format of the task List.
Generally, the format for these settings is a string containing the standard double braces notation for params:

```
Params like {{this}} or {{ this }} will be expanded
{{ params }} followed by ?, will only be expanded when the param expand to something truthy
They and all the text following them until '?' will be hidden if falsy
sub-objects will also be expanded when using the dot-notation {{ param.deep.inner }}
params that are not strings, numbers or boolean will be stringified using the object's toString() method
In list renderings the parameters {{index}} and {{nextIndex}} are available as well
```

Available params will be supplied in the setting's documentation.

## Custom Params

Custom Params can be included in the extension's settings. Two examples (goals and achievements) are already included.
They will be suggested in the timelog files and can be included in the generated task list / summaries.
They will be formatted using the template set in the configuration and can simply be included by using {{<param-name>}} in another template.