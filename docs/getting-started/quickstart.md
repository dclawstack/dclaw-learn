# Quickstart

This guide walks you through the core workflows in DClaw Learn from a fresh install.

## 1. Start the app

```bash
docker compose up -d
```

Open http://localhost:3008. You will see the home page with two buttons: **Browse Courses** and **My Dashboard**.

## 2. Create an account

1. Click **Register** in the top-right navigation.
2. Enter your name, email, and a password (minimum 8 characters).
3. You will be redirected to the login page.
4. Log in — the nav bar will show your name and a **Logout** button.

## 3. Browse and enroll in a course

1. Click **Courses** in the nav bar.
2. A sample course ("Introduction to Machine Learning") is seeded automatically.
3. Use the search box or category filter to find courses.
4. Click a course card to open the detail page.
5. Click **Enroll** to start tracking your progress.

## 4. Complete lessons and track progress

On the course detail page:

1. Click the **Complete** button next to each lesson.
2. The progress bar updates in real time.
3. When all lessons are done the bar reaches 100% and a **Get Certificate** button appears.

## 5. Get a certificate

After completing all lessons:

1. Click **Get Certificate** — you must be logged in.
2. An alert shows your unique certificate number and issue date.

## 6. Generate an AI quiz

1. Click **Quiz** in the nav bar.
2. Paste any text (lecture notes, article, study material).
3. Click **Generate Quiz** — if Ollama is running with `llama3`, real multiple-choice questions are generated. Otherwise, keyword-extraction questions are used as a fallback.
4. Answer the questions and click **Submit Quiz** to see your score and explanations.

## 7. Create a study plan

1. Click **Study Plan** in the nav bar.
2. Enter a title (e.g. "Learn Python in 4 weeks"), a goal, choose a pace, and set the number of weeks.
3. Click **Create Plan** — daily tasks are generated and displayed in a checklist.
4. Use the pace dropdown to adjust the plan without losing progress.

## 8. Discuss a course

1. Open any course detail page.
2. Click the **Forum** tab.
3. Click **Post** to start a new discussion thread (requires login).
4. Replies appear inside the thread.

## 9. Submit an assignment

1. Open a course detail page.
2. Click the **Assignments** tab.
3. If an instructor has created assignments, you will see them listed.
4. Type your answer in the text area and click **Submit**.
5. Grades and feedback appear here once an instructor reviews your submission.

## 10. Check the dashboard

The **Dashboard** shows:

- Your enrolled courses with progress bars
- Aggregate stats (streak days, hours studied, courses completed)
- **Recommended for You** — courses in the same categories you've already enrolled in, at the next difficulty level
