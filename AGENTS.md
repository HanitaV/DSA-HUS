# Repository Guidelines

## Project Structure & Module Organization

This repository collects HUS programming and algorithm course materials. `docs/` contains numbered course folders: introductory programming (15), object-oriented programming (16), data structures and algorithms (17), and algorithm design and analysis (18). Lectures, reference books, assignments, and exams sit within their respective courses. Java source and console test programs live alongside exercises, especially under course 16's `Lab (Bài tập thực hành)/` and `Exams/` folders; there is no shared `src/` or `tests/` directory.

`agent/skills/`, `.agents/`, and `.claude/` contain assistant tooling. Keep course contributions in `docs/` and avoid incidental tooling changes.

## Build, Test, and Development Commands

There is no repository-wide build, development server, or test command. Use a JDK to compile and run individual Java exercises. For example, from PowerShell at the repository root:

```powershell
$exercise = 'docs/16. Lập trình hướng đối tượng/Lab (Bài tập thực hành)/Lab 4- Classes and Objects/lab04/MyPoint'
javac -encoding UTF-8 -d out "$exercise/MyPoint.java" "$exercise/TestMyPoint.java"
java -cp out hus.oop.lab.lab04.MyPoint.TestMyPoint
```

The first command compiles one exercise into `out/`; the second runs its console checks. Compile exercises separately because examples may reuse class names. Do not commit generated `.class` files or `out/`.

## Coding Style & Naming Conventions

Match surrounding Java code: four-space indentation, braces on the declaration line, `PascalCase` classes, and `camelCase` methods and variables. Preserve existing package declarations and match public class names to filenames. Keep Vietnamese folder names, accents, and course numbering intact. Quote paths containing spaces. No shared formatter or linter is configured.

## Testing Guidelines

Existing checks use runnable classes such as `TestMyPoint` and `TestMain`; no shared testing framework or coverage threshold is configured. Run the relevant entry point and compare output with the exercise requirements. For algorithm changes, check normal inputs, empty or boundary inputs, and duplicates where applicable. Record commands and results in the pull request.

## Commit & Pull Request Guidelines

Git history currently contains only `Initial commit`, so no established message convention exists. Use concise, imperative messages, for example `Add binary search boundary examples`. Keep changes focused on one exercise or topic. Pull requests should identify the course and exercise, explain changes, link related issues when available, and describe validation. Open added documents to verify readability; include screenshots only when visual changes need explanation.
