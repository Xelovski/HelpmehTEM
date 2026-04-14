# 🎯 How to Use the Online School System

This guide walks you through using the application step by step.

## 👤 User Types

There are three types of users in the system:

### 1. **Students** 👨‍🎓
- Browse available courses
- Enroll in courses
- View assignments
- Submit work
- Check grades

### 2. **Professors** 👨‍🏫
- Create new courses
- Write lessons
- Create assignments
- Grade student submissions
- Manage enrolled students

### 3. **Administrators** 🔐
- View system overview
- Manage users
- Monitor courses
- Adjust system settings

---

## 🚀 Getting Started

### Step 1: Create Your Account

1. Go to http://localhost:3000 (or your production URL)
2. Click **"Sign Up"** button
3. Enter your email and password
4. Choose your role:
   - Select **"Student"** if you're learning
   - Select **"Professor"** if you're teaching
5. Click **"Create Account"**
6. You'll be redirected to the dashboard

### Step 2: Log In

If you already have an account:

1. Go to http://localhost:3000
2. Click **"Login"** button
3. Enter your email and password
4. Click **"Login"**
5. You'll see the dashboard

### Step 3: Explore the Dashboard

The sidebar shows different options based on your role:

**For Students:**
- 📚 **My Courses** - Courses you're enrolled in
- ✅ **Assignments** - Your assignments to complete
- 📊 **Grades** - Your grades and progress

**For Professors:**
- 📚 **My Courses** - Courses you teach
- ➕ **Create Course** - Make a new course
- 👥 **Students** - Your enrolled students

**For Admins:**
- 📊 **Overview** - System statistics
- 👥 **Users** - Manage users
- 📚 **Courses** - All courses
- ⚙️ **Settings** - System configuration

---

## 📚 Student Workflow

### Browsing Courses

1. Click **"My Courses"** in the sidebar
2. You'll see all available courses
3. Each course shows:
   - Course title
   - Professor's name
   - Course code (like "CS-101")
   - Description
4. Click **"Enroll"** to join a course

### Viewing Lessons

1. Click on a course you're enrolled in
2. You'll see all lessons for that course
3. Each lesson shows:
   - Lesson title
   - Lesson content
   - Order in the course
4. Click a lesson to read its content

### Completing Assignments

1. Click **"Assignments"** in the sidebar
2. Find the assignment you need to complete
3. Click on it to see details:
   - Assignment description
   - Due date
   - Maximum points
4. Scroll down to submit:
   - Type your answer in the text field, OR
   - Upload a file
5. Click **"Submit"**
6. Confirmation message appears

### Checking Grades

1. Click **"Grades"** in the sidebar
2. See all your assignments and their grades
3. Click on a grade to see:
   - Points earned
   - Feedback from professor
   - Due date
   - Submission date

---

## 🎓 Professor Workflow

### Creating a Course

1. Click **"Create Course"** in the sidebar
2. Fill in the course details:
   - **Title** - Course name (e.g., "Introduction to Python")
   - **Code** - Unique code (e.g., "PY-101")
   - **Description** - What the course is about
3. Click **"Create Course"**
4. The course is now visible to students

### Managing a Course

1. Click **"My Courses"** in the sidebar
2. Click on the course you want to manage
3. You can now:
   - View enrolled students
   - Add lessons
   - Create assignments
   - Grade submissions

### Adding Lessons

1. In your course, click **"Add Lesson"**
2. Fill in lesson details:
   - **Title** - Lesson name
   - **Description** - Short summary
   - **Content** - The lesson material (can include HTML)
   - **Order** - Position in the course
3. Click **"Create Lesson"**
4. Students will see this lesson in the course

### Creating Assignments

1. In your course, click **"Create Assignment"**
2. Fill in assignment details:
   - **Title** - Assignment name
   - **Description** - What students need to do
   - **Due Date** - When it's due
   - **Max Points** - Points possible
3. Click **"Create Assignment"**
4. Students will see the assignment

### Grading Submissions

1. In your course, click **"View Submissions"**
2. See all student submissions
3. Click on a submission to see:
   - Student's answer or uploaded file
   - Submission date/time
4. Enter your grade:
   - **Score** - Points awarded (out of max)
   - **Feedback** - Comments for the student
5. Click **"Submit Grade"**
6. Student can now see their grade

### Managing Students

1. Click **"Students"** in the sidebar
2. See all students enrolled in your courses
3. View:
   - Student's name and email
   - Courses they're taking
   - Their overall progress
4. (Optional) Click student to see more details

---

## 🔧 Admin Workflow

### Viewing System Overview

1. Click **"Overview"** in the sidebar
2. See key statistics:
   - Total users (students, professors, admins)
   - Total courses
   - Total enrollments
   - System health

### Managing Users

1. Click **"Users"** in the sidebar
2. See list of all users with:
   - Email address
   - User role
   - Created date
3. Click a user to:
   - Change their role
   - View their courses/enrollments
   - (Optional) Deactivate account

### Viewing All Courses

1. Click **"Courses"** in the sidebar
2. See all courses in the system
3. View course details:
   - Title and code
   - Professor name
   - Number of students
   - Number of assignments
4. (Optional) Click course for more details

### System Settings

1. Click **"Settings"** in the sidebar
2. Configure:
   - System name
   - Maintenance mode
   - Email settings
   - Other preferences
3. Click **"Save Changes"**

---

## 🔐 Account Management

### Viewing Your Profile

1. Look for your email in the top right
2. Click the dropdown with your name
3. See your profile information:
   - Your role
   - Email address
   - Name

### Logging Out

1. Click your name in the top right corner
2. Click **"Logout"** in the dropdown
3. You'll be redirected to the login page

### Changing Password

Currently, passwords can be changed through Supabase auth. Future versions may include in-app password management.

---

## 💡 Tips & Tricks

### For Students
- 📅 **Mark Due Dates** - Keep track of assignment due dates
- 📝 **Save Early** - Submit assignments before the deadline
- ❓ **Ask Questions** - Use assignment comments for clarification
- 📊 **Monitor Progress** - Check your grades regularly

### For Professors
- 📋 **Organize Content** - Order lessons logically
- 📐 **Set Realistic Deadlines** - Give students enough time
- 📝 **Provide Feedback** - Write helpful comments when grading
- 👥 **Monitor Enrollment** - Keep track of your class size

### For Admins
- 🔍 **Monitor Activity** - Check usage statistics
- 👤 **Create Test Accounts** - Test features as different roles
- 📊 **Plan Capacity** - Anticipate growth
- 🔐 **Maintain Security** - Keep system updated

---

## ⚠️ Common Issues

### "Can't see courses"
- Make sure you're logged in as a student
- Check that professors have created courses
- Refresh the page

### "Can't enroll in course"
- Make sure you're logged in as a student
- The course must exist and be active
- You can't enroll if already enrolled

### "Assignment won't submit"
- Check the file size (if uploading)
- Make sure deadline hasn't passed
- Refresh and try again

### "Can't see grades"
- Wait for professor to grade your work
- Check that assignment has been graded
- Refresh the page

---

## 📞 Getting Help

### If Something Breaks
1. Refresh the page (F5 or Cmd+R)
2. Try logging out and back in
3. Check your browser console for errors (F12)
4. See [TROUBLESHOOTING.md](./DEPLOYMENT.md#troubleshooting)

### If You Need Help
1. Check [README.md](./README.md) - Full documentation
2. Check [QUICKSTART.md](./QUICKSTART.md) - Setup help
3. Review this guide again
4. Check [CONTRIBUTING.md](./CONTRIBUTING.md) - Developer help

---

## 🎓 Example Workflow

Here's a complete example from start to finish:

### Professor Creates a Course
1. Professor signs up and chooses "Professor"
2. Clicks "Create Course"
3. Enters "Physics 101" with code "PHYS-101"
4. Clicks "Create Course"

### Professor Adds Content
1. Goes to "My Courses" → "Physics 101"
2. Adds 3 lessons: "Introduction", "Newton's Laws", "Energy"
3. Creates first assignment: "Problem Set 1" due next week

### Student Enrolls
1. Student signs up and chooses "Student"
2. Clicks "My Courses"
3. Finds "Physics 101" in the list
4. Clicks "Enroll" and joins the course

### Student Submits Work
1. Student goes to "Assignments"
2. Finds "Problem Set 1"
3. Reads the assignment
4. Types their answers
5. Clicks "Submit"
6. Gets confirmation "Submitted successfully!"

### Professor Grades
1. Professor goes to "My Courses" → "Physics 101"
2. Clicks "View Submissions"
3. Finds the student's submission
4. Reads their answers
5. Enters score: "45/50"
6. Adds feedback: "Great work! Watch signs on problem 3."
7. Clicks "Submit Grade"

### Student Checks Grade
1. Student goes to "Grades"
2. Finds "Problem Set 1" with score "45/50"
3. Reads professor's feedback
4. Understands where they lost points
5. Does better on next assignment!

---

## 🚀 You're Ready!

You now know how to use the Online School System. Start by:

1. **Creating your account** (Student or Professor)
2. **Exploring your dashboard**
3. **Trying the main features**
4. **Inviting others to join**

Happy learning! 🎉

---

**Questions?** See [README.md](./README.md) or [SETUP.md](./SETUP.md)
