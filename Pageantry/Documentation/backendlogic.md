This documentation is meant to explain the entire logic and structure of the PageantryVoting project.

This project is meant to do more that intended but i am limiting it's capabilities to only Pageantry for the time being.

What are the entities needed ?

Authentication
a. username and password
b. email (for verification purposes)
c. phone (for verification purposes)
d. profile (one_to_one relationship)

1. Organizers Profile- 
Features
a. Name
b. user(one_to_one relationship)
c. events (foreign_key relationship)
d. 

Roles
a. They create events
b. They control event details (which will be explained more in the event entity)


2. Events 
Features
First Phase
1. Name of the event
2. Custom Event Banner
3. Categories of the event

a. Name of the event
b. Start time
c. End time 
d. Contestants(foreign key relationship)
e. Wallet (one_to_one relationship)
f. amount_per_vote
g. event organizer 
h. judges of the event(this will be added on later)
i. Votes
j. created_at 
k. banner


3. Wallet 
Features
a. event Wallet(one_to_one relationship)
b. organizer in control(foreign_key)
c. created_at


4. Contestant 
The contestants will be created by the organizers but bounded by the events. 
Features
a. Name
b. Aspiring Portfolio
c. total votes 
d. photo
e. event

5. Vote.
Features 
a. event(one_to_one relationship)
b. contestant_for (one_to_one relationship)
c. payment_status (one_to_one)
d. created_at



What is the logic behind each app
Authentication Logic
1. User creates an account and automatically gets an organizer profile
2. User can logout when they want to 
3. User is supposed to verify their email and phone number before allowing access to organizer actions 
<!-- NOW AT STEP 2 -->

Organizer Logic 
1. User creates an account and automatically gets signed as an organizer 
2. User should be thoroughly verified (email, and password)
3. User should have their entire profile filled before being allowed to create an event 
