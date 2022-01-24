import React from 'react'
import {Link} from 'react-router-dom'
import './css/DefaultPage.css'

export default function DefaultPage() {

    return(
        <div>
            <Link to ={'/createNewMeeting'} id='meetingLink'>Create a Meeting</Link>
            <div id="infoParagraph">                
                <h2 id="infoHeader">Welcome to schedule my meeting</h2>
                <p>
                    You can use this website to create a meeting and then schedule it with your colleagues or friends.
                    You can click <Link to={'/createNewMeeting'}>here</Link> to create a new meeting or you the button on the left.
                    Every meeting has to have a unique name. The unique name is case sensitive and can include numbers, uppercase and lowercase letters.
                    Every meeting lasts for up to two weeks, but if you are done with the meeting, please consider deleting it.
                </p>
                <h2>Why another meeting finder?</h2>
                <p>
                    There are plenty of meeting creation/meeting finder pages out there. I tried some of them, but for me
                    they didn't quite do what i needed for my friends group. This page is quite unique in the way that the times
                    are put into the page as every user can provide their own time slots and are not limited to what the creator
                    thinks are the best time slots.
                </p>
                <h2>A detailed explantion on how to use this site</h2>
                <p>
                    If you want to schedule a meeting, you can click <Link to={'/createNewMeeting'}>here</Link> or use the big blue button on the left.
                    Once you clicked it, you will be redirected to an input form. Here you have to provide a unique name for your meeting.
                    This name can include upper- and lowercase letters as well as numbers.
                    After setting a name, you have to provide a password. The password can be anything except blank.
                    Then you have to select two dates, a starting date and an ending date. These dates will both be included in the time, so if 
                    you want to find a good meeting spot between the 2nd march 2021 and the 5th march 2021 then you'd have to select these two dates.
                    After selecting the dates you have to provide a length for the meeting. A meeting can only last up to 23 hours and 45 minutes.
                    If you are not sure how long your meeting will last, you can either select a little bit less, i.e. if you meeting lasts up to 2 hours,
                    you could just select 1 hour. This has the advantage of also showing you times where people might only be available for an hour and 30 minutes
                    and then you could cut the meeting short.
                    If you just want to find out the most overlapping times in between the selected dates, just put in 15 minutes. This is the smallest selectable
                    meeting length and if you choose this option, all put in times from all participants will be considered.
                    Lastly, you need to put in the amount of participants. It is strongly advised that you put in the correct number. If you choose a number that is too small
                    It is not possible to increase the number later on. If you put in too many people, the algorithm to determine the optimal time cannot work as efficiently as possible.
                    So if you don't know how many people will attend your meeting, feel free to select a minimum but make sure, that you select enough.
                </p>
                <p>
                    Once this form is filled out and sent to the server, you will be redirected to the meeting screen. As you can see, you have a scrollable calender
                    and a box to select the quality of the time slot. If a slot works particularly well for you, then please select the "perfect" option.
                    If you have a slot that works, and you are indifferent on wether the meeting is at that time or not, please select the "works" option.
                    If you have a slot where you could attend, but you would rather not, please select the "rather not" option.
                    In order to put in your times, you first have to register your username. Select the input field above the calender, and either click on the 
                    "Add new user" option, or start typing your username in the field. Your username must be unique and can include upper- and lowercase letters 
                    as well as numbers. If you are happy with your username, please click register. Your username is now registered. Now you can start putting in your times.
                    To do that, click on the start of the time slot and drag your mouse down until the slot is fully selected.
                    Say you are available from 10am to 12am, you click and hold down the mouse on the 10:00 slot and drag it down to the 12:00 slot.
                    This time slot should now be shown in either, green, blue or red, depending on the selected quality. If you are unhappy with a selected slot, 
                    Just click it anywhere (while the selected quality matches) and it will be deleted.
                    If you like the time of a timeslot, but you want to change the quality, just select another quality and click the slot anywhere.
                    If you are happy with your put in times, click the "save" button below the calendar. Now your times are saved and will be taken 
                    into consideration when the algorithm determines a good meeting time.
                    If you want to share the link to the meeting, click the "copy" button below the calendar. This will copy the link to the meeting 
                    and then you can share it with your fellow participants. You also have to tell your fellow participants the password to your meeting.
                    If you want to edit the times you put in, you can just click on the link you got from the website (and hopefully shared), 
                    then you can select your username, click the "load" option to the right of the input field. Now you can see the times you put in before.
                    You can edit them how you like (you can delete, change the quality of the time slot, or add in new times) and when you are done, 
                    you need to click the "save" button again, to save them on the server.
                </p>
                <p>
                    If you want to find the optimal meeting slot, you can click the "Generate Best Meeting(s)" button.
                    Once you did that, the website will change slighly and you can now see the calender you used to put in your times, 
                    but now you can see the best times for a meeting. The timeslots will now be shown in shades of green, where a brighter green 
                    means that the quality of the time slot is higher. So if you selected perfect and another participant also did that, said time 
                    slot will be brigher, than if you both selected "works". If it was not possible to find a timeslot where all participants can attend, 
                    i.e. there is absolutely no overlap in your put in times, the website will show you all times in shades of green, where a brigher green 
                    means, that more people can attend that time slot.
                    If you are not happy with the generated data, or you need to edit your data, you need to click the "Take me back" button.
                </p>
            </div>
            <div id='contactWrapper'>
                <p id='personal'>This website was designed and build by Jan Moritz Pocher</p>
                <p id='contact'>If you need to contact me, feel free to send me an email to: <br />info@schedule-my-meeting.com</p>
                <p id='github'>If you find there to be a problem with this website, please feel free to open an issue on <a target="_blank" href='https://github.com/JanMoritzP/schedule-my-meeting/issues/new?assignees=JanMoritzP&labels=bug&template=issue.md&title='>my Github</a></p>
            </div>
        </div>
    )

}