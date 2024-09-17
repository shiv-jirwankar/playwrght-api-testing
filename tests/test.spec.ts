import  { expect, test } from "playwright/test";
import getBookingIdSchema from "../test-data/json-schema/get-booking-id.json";
import { getHeader, getToken } from "../utils/test-util";
import Ajv from "ajv";
import postBody from "../test-data/booking-body.json";
import updateBody from "../test-data/update-body.json";
import patchBody from "../test-data/patch-body.json";

let bookingID: string;

test.beforeEach('Return random booking ID', async ({request}) => {   
    const response = await request.get('https://restful-booker.herokuapp.com/booking');
    await expect(response).toBeOK();
    const responseJson = await response.json();
    const randomIndex = Math.floor(Math.random() * responseJson.length);
    bookingID = responseJson[randomIndex].bookingid;
});

test('Verify POST request and GET request',async ({request}) => {
    let createdBookingID: string;
    let getResponse;

    await test.step('Verify POST request', async () => {
    const response = await request.post('https://restful-booker.herokuapp.com/booking', {
        data: postBody
        });
    await expect(response).toBeOK();
    const responseJson = await response.json();
    createdBookingID = responseJson.bookingid;
    });

    await test.step('Verify GET Request', async () => {
        getResponse = await request.get(`https://restful-booker.herokuapp.com/booking/${createdBookingID}`);
        await expect(getResponse).toBeOK();
        const getResponseJson = await getResponse.json();
        expect(getResponseJson.firstname).toBe(postBody.firstname);
        expect(getResponseJson.lastname).toBe(postBody.lastname);
    });

    test.step('Verify JSON schema', async () => {
        const ajv = new Ajv();
        const valid = ajv.validate(getBookingIdSchema, await getResponse.json());
        expect(valid, "JSON schema of /booking/{id} should be valid").toBeTruthy();
    });
});

test('Verify PUT request', async ({request}) => {
    const token = await getToken(request);

    const response = await request.put(`https://restful-booker.herokuapp.com/booking/${bookingID}`, {
        data: updateBody,
        headers: getHeader(token)
    });

    await expect(response).toBeOK();
});

test('Verify PATCH request', async ({request}) => {
    const token = await getToken(request);
    const response = await request.patch(`https://restful-booker.herokuapp.com/booking/${bookingID}`, {
        data: patchBody,
        headers: getHeader(token)
    });
    await expect(response).toBeOK();
});
test('Verify DELETE request', async ({request}) => {
    const token = await getToken(request);
    console.log('Token:', token);
    const response = await request.delete(`https://restful-booker.herokuapp.com/booking/${bookingID}`,{
        headers: getHeader(token)
    });
    await expect(response).toBeOK();

    const getResponse = await request.get(`https://restful-booker.herokuapp.com/booking/${bookingID}`);
    await expect(getResponse).not.toBeOK();
});