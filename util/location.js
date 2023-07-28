const axios = require('axios');
const HttpError = require('../models/http-error');


const getCoordForAddress = async (address) => {
    const url = `${process.env.MOB_URL}/${encodeURIComponent(address)}.json?access_token=${process.env.MOB_ACCESS_TOKEN}&limit=1`
    const response = await axios.get(url);
    const coordinates = {}
    if(response?.data?.features[0]?.center){
        coordinates.lat = response.data.features[0].center[1]
        coordinates.lng = response.data.features[0].center[0]
        return coordinates;
    }else{
        throw new HttpError('Location not found', 422)
    }

    
}

module.exports = getCoordForAddress