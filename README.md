# Team up (Server)

## Project About

- A place to find project inspirations to work on
- Free projects to level up your skills
- Learn to work together in groups
- Display your personal projects for potential recruiters
- Connect with hundreds on individuals while with like minds while being updated on the latest technologies and best practices.

## To build

- Authentication, JWT, etc
- Google login and sign up
- Real time chat connection
- Uploading of images, videos and files
- Create and model relationships

## Completed features

## Errors signature

<!-- Successful request messages -->
- 200 - Successful
- 201 - Created
- 203 -
- 204 - No content ie (deleted with no content to return)


<!-- Customized errors  -->
- 400 - Bad request
- 401 - 
- 402 - 
- 403 - 
- 404 - Not found

## Creating and sending customized errors

- Import AppError
- Pass new instance of AppError to the global error handler using the next function
- AppError has two parameters: Error message, and error code


## Routes
- BaseUrl -  /api/v1

### Authentication - /user
- Sign up - /signup
- Login - /login

### Users - /user
- Get all users - /
- Get other users - /other-users
- Get Logged user's info (Get) - /me
- Edit users info (Patch) - /me
- Update password(Post) - /update-password
- Change profile photo(Patch) - /change-profile-photo
- Delete profile photo(delete) - /delete-profile-photo

