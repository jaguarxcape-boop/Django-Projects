<!-- LOGIN DOCUMENTATION -->


🔴🔴🔴🔴🔴🔴🔴🔴BACKEND🔴🔴🔴🔴🔴🔴🔴🔴
The login component has a `urls.py` and a `views.py`.

🔴🔴🔴🔴🔴BACKEND VIEW🔴🔴🔴🔴🔴
🔴🔴🔴🔴Overview
🔴🔴The LoginView handles POST requests to authenticate users. It bypasses standard authentication and permission checks to ensure that unauthenticated users can access the endpoint.

🔴🔴Class Attributes
🔴permission_classes: Set to [AllowAny]. This allows any user, regardless of whether they are logged in or not, to access this view.

🔴authentication_classes: Set to an empty list []. This ensures that the view does not attempt to verify a user's token or session before processing the request.

🔴🔴🔴Methods
🔴🔴post(self, request)
Processes the incoming login data.

 1. The view retrieves only two details `username` and `password` from the front end then proceeds to perform the following checks

🔴Checks if the either field is blank and returns and error
🔴Attempts to authenticate the user 
    If not successful:
        An error response is thrown with the accompanying details
    If successful:
        1. The `RefreshToken` module is used to get or create a token for the user
        2. The access and refresh token are sent to the user alongside a successful login message


`NOTE: THE VIEW DOES THE FOLLOWING`
✅GETS USER CREDENTIALS

✅AUTHENTICATES THEM IF THEY ARE VALID USING `authenticate`

✅CREATES OR RETRIEVES AN `ACCESS` AND `REFRESH` JWT AND SENDS IT TO THE CLIENT


`THIS IS SUBJECT TO CHANGE AS I TRANSITION TO SETTING THE REFRESH TOKEN IN THE COOKIES BUT I WILL DO THAT AT THE LAST PART`

🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴FRONTEND🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴


Logic

1. A username and password form is displayed to the user to enter their credentials
2. No checks except the `required` attribute is placed here 
3. A POST request with the following details is sent to the backend
    `No Authorization Header`
    `A body containing username and password`
4. Upon successful login the `access_token` and `refresh_token` is received and stored in `localStorage` alongside other accompanying details
5. This is because the `access_token` has a very short expiry time as compared to the `refresh_token` so we need the `refresh_token` to get us a new `access_token` 
6. If unsuccessful, an error is thrown