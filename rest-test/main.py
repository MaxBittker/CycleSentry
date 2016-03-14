# REST API test for CycleSentry

# Asserts that the outputs and inputs behave as expected
# Last modified March 14, 2016 by Ben Brown <b.brown@queensu.ca>

import time

import requests


ENDPOINT = "http://159.203.112.6/api"


def main():
    # Sanity check - make sure the server is up
    try:
        assert_equals("hello world", echo("hello world"))
    except:
        print("Echo failed.")
        return
    print("Echo test passed")

    # Find ourselves a new friendly ID that will not conflict with an existing one
    try:
        new_friendly_id = get_unique_user_id()
    except:
        print("Getting new friendly ID failed.")
        return

    # Make a new account
    try:
        new_unfriendly_id, name, password = insert_user(new_friendly_id)
    except:
        print("Creating a new user failed.")
        return

    # Ensure the new account was actually created
    try:
        user_was_added(new_unfriendly_id, new_friendly_id, name, password)
    except Exception as e:
        print("User was not successfully created: " + str(e))
        return
    print("User creation test passed.")

    # Get ourselves a new and unique tag ID
    try:
        new_tag_id = get_unique_tag_id()
    except Exception as e:
        print("Getting a new tag ID failed. : " + str(e))
        return

    # Insert the tag
    try:
        tag_db_id, tag_type, tag_name = insert_tag(new_friendly_id, new_tag_id)
    except Exception as e:
        print("Inserting tag failed. :" + str(e))
        return

    # Make sure the tag was actually inserted
    try:
        tag_was_added(new_friendly_id, new_tag_id, tag_type, tag_name)
    except Exception as e:
        print("Tag was not successfully inserted." + str(e))
        return
    print("Tag insertion test passed. ")

    # Change the tag's location two times to make sure it can be set and changed
    try:
        change_tag_location(new_tag_id, -2)
        assert_tag_location(new_friendly_id, new_tag_id, -2)
        change_tag_location(new_tag_id, 1)
        assert_tag_location(new_friendly_id, new_tag_id, 1)
    except Exception as e:
        print("Tag location was not changed successfully" + str(e))
        return
    print("Tag location change test passed.")

    # We don't know the correct sign in time, but we will make sure the result is syntactically valid
    try:
        assert_time_signed_in_works(new_friendly_id)
    except Exception as e:
        print("Time signed endpoint does not work" + str(e))
        return
    print("Time signed in test passed.")

    # We don't know the correct average sign in time, but we will make sure the result is syntactically valid
    try:
        assert_average_first_sign_in_time_works(new_friendly_id)
    except Exception as e:
        print("Average first sign in time does not work" + str(e))
        return
    print("Average first sign in time test passed.")

    # We know the exact location data, so will check it thoroughly
    try:
        assert_location_info_correct()
    except Exception as e:
        print("Location info is incorrect." + str(e))
        return
    print("Location info test passed.")

    # We will make sure the alarm goes off
    try:
        change_tag_location(new_tag_id, -1)
        time.sleep(10)
        assert_alarm_is_going_off()
        change_tag_location(new_tag_id, 1)
    except Exception as e:
        print("Alarm did not go off as planned." + str(e))
        return
    print("Alarm test passed.")
    print("All tests passed.")


def assert_alarm_is_going_off():
    res = requests.get(ENDPOINT + "/shouldAlarm/")
    res_body = res.text
    assert_equals("1", res_body)


def assert_location_info_correct():
    res = requests.get(ENDPOINT + "/getLocationInfo/")
    res_json = res.json()
    res.close()
    assert_equals(1, len(res_json))
    location = res_json[0]
    assert_equals(location['locationid'], 1)
    assert_equals(location['capacity'], 1)


def assert_average_first_sign_in_time_works(friendly_id):
    res = requests.get(ENDPOINT + "/averageFirstSignInTime/" + str(friendly_id))
    res_json = res.json()
    res.close()
    res_body = res_json['secondsPastMidnight']
    res_str_to_int_to_str = str(int(res_body))
    assert_equals(res_body, res_str_to_int_to_str)


def assert_time_signed_in_works(friendly_id):
    res = requests.get(ENDPOINT + "/timeSignedInToday/" + str(friendly_id))
    res_json = res.json()
    res.close()
    res_body = res_json['secondsSignedInToday']
    res_str_to_int_to_str = str(int(res_body))
    assert_equals(res_body, res_str_to_int_to_str)


def change_tag_location(tag_id, new_location):
    res = requests.get(ENDPOINT + "/updateTag/" + str(tag_id) + "/" + str(new_location))
    res_body = res.text
    res.close()
    assert_equals("1", res_body)


def assert_tag_location(friendly_id, tag_id, expected_location):
    user = _get_user_info(friendly_id)
    tags = user['tagInfo']
    for tag in tags:
        if int(tag['TagID']) == tag_id:
            state = tag['state']
            assert_equals(state['location'], expected_location)
            return
    raise Exception("Tag status was not changed.")


def tag_was_added(friendly_id, tag_id, tag_type, tag_name):
    user_info = _get_user_info(friendly_id)
    tag_info = user_info['tagInfo']
    for tag in tag_info:
        if int(tag['TagID']) == tag_id:
            assert_equals(tag['name'], tag_name)
            assert_equals(tag['type'], tag_type)
            return
    raise Exception("Tag was not added properly.")


def user_was_added(unfriendly_id, friendly_id, name, password):
    res_json = _list_users()
    for user in res_json:
        if int(user['UID']) == friendly_id:
            assert_equals(user['_id'], unfriendly_id)
            assert_equals(user['name'], name)
            assert_equals(user['password'], password)
            return
    raise Exception("User not added properly. ")


def insert_user(friendly_id, name="Test", password="Password"):
    if name == "Test":
        name = "Test " + str(friendly_id)

    res = requests.get(ENDPOINT + "/insertUser/" + str(friendly_id) + "/" + name + "/" + password)
    db_id = res.text
    res.close()
    db_id = db_id.replace('"', "")
    return db_id, name, password


def insert_tag(friendly_id, tag_id, tag_type="bike", tag_name="test tag"):
    if tag_name == "test tag":
        tag_name += " " + str(tag_id)

    res = requests.get(
        ENDPOINT + "/insertTag/" + str(friendly_id) + "/" + str(tag_id) + "/" + tag_type + "/" + tag_name)
    db_id = res.text
    res.close()
    db_id = db_id.replace('"', "")
    return db_id, tag_type, tag_name


def get_unique_user_id():
    res_json = _list_users()
    user_ids = []
    for user in res_json:
        user_ids.append(int(user['UID']))
    current_max_user_id = max(user_ids)
    return current_max_user_id + 1


def get_unique_tag_id():
    res_json = _list_users()
    tag_ids = []
    for user in res_json:
        user_id = user['UID']
        user_info_json = _get_user_info(user_id)
        tags = user_info_json['tagInfo']
        for tag in tags:
            theTagId = tag['TagID']
            try:
                tag_ids.append(int(theTagId))
            except:
                pass
    return max(tag_ids) + 1


def echo(text="hello world"):
    res = requests.get(ENDPOINT + "/echo/" + text)
    result_text = res.text
    res.close()
    return result_text


def assert_equals(a, b):
    if str(a) != str(b):
        raise Exception(str(a) + " did not equal " + str(b))


def _get_user_info(friendly_id):
    res = requests.get(ENDPOINT + "/getUserInfo/" + str(friendly_id))
    user_info_json = res.json()
    return user_info_json


def _list_users():
    res = requests.get(ENDPOINT + "/listUsers")
    res_json = res.json()
    res.close()
    return res_json


main()
