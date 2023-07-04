const axios = require('axios');
const HttpError = require('../models/http-error');

const mobAccessToken = 'pk.eyJ1IjoiZXN0ZWJhbmZhayIsImEiOiJjbGl6MWd6cmYwMnhsM2xuZTQ4Y2Z3NjdrIn0.lwRj54VzK6mXwfdWeyyqGg'
const mobUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places/'

const getCoordForAddress = async (address) => {
    const url = `${mobUrl}/${encodeURIComponent(address)}.json?access_token=${mobAccessToken}&limit=1`
    const response = await axios.get(url);
    const coordinates = {}
    if(response?.data?.features[0]?.center){
        coordinates.lat = response.data.features[0].center[1]
        coordinates.long = response.data.features[0].center[0]
        return coordinates;
    }else{
        throw new HttpError('Location not found', 422)
    }

    
}

module.exports = getCoordForAddress