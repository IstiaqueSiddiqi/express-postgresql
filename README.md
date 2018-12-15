# Express-Postgresql REST APIs
REST API's using node.js, express.js, postgresql

## Overview
Basic REST APIs for student/teacher platform which supports simple operations for managing the university database. The goal is to expose REST APIs to manage the app.

## Exposed base URL
Visit base URL at https://postgresql-api.herokuapp.com/ to test different endpoints

### GET/students

API returns list of all the students filtered by the provided parameters.

#### Note:
1. If no parameters are given, then API should return all the students.
2. Returns an empty array if no students are available with the given query.
3. All API responses are paginated

```
Supported Search Parameters:

1. classes - should accept list of class IDs - filters out students from the given list of classes.
2. admissionYearAfter - accepts year in format (yyyy) - should filters students whose admissionDate is in or after the given year.
3. admissionYearBefore - accepts year in format (yyyy) - should filters students whose admissionDate is before the given year

For e.g
/students
Return all the students

/students?classes[]=1
Return all students from class 1

/students?classes[]=1&classes[]=2&active=true
Return all active students from class 1 & 2.

/students?classes[]=1&classes[]=2&admissionYearAfter=2017&active=true
Return all active students from class 1 & 2 who were admitted in or after 2017

```

### GET/students/{id}
Return a single student whose id is given.

### GET/students/{id}/classes
Return the semester classes student is part of (including the professor teaching the class). 
Note: These should return ‘HTTP Status 404’, if no student is available with the given id.

### POST/students
Creates a student. Make sure that name and admissionDate shouldn’t be empty or null. Roll no should be auto assigned and unique. 
Also, by default, a student should be active. Note: Should return ‘HTTP status 201 Created’ once a student has been added to DB.

### PATCH/students/{id}
Allows updating of only name attribute for the given student.

### DELETE/students/{id}
Should make the student inactive.

### GET/classes
Returns list of classes.

### POST/classes/{id}/students
Add provided students to a semester class.

```
Pagination:

Paginate the response from GET /students. Should provide support for following parameters apart from the above mentioned filters.
1. pageSize - int, to specify the pageSize
2. pageNumber - int
Default value for pageSize and pageNumber should be 20 and 1 respectively.
```
