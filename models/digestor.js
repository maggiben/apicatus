///////////////////////////////////////////////////////////////////////////////
// @file         : digestor.js                                               //
// @summary      : Digestor schema                                           //
// @version      : 0.1                                                       //
// @project      : mia.pi                                                    //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 6 Oct 2013                                                //
// ------------------------------------------------------------------------- //
//                                                                           //
// @copyright Copyright 2013 Benjamin Maggi, all rights reserved.            //
//                                                                           //
//                                                                           //
// License:                                                                  //
// This program is free software; you can redistribute it                    //
// and/or modify it under the terms of the GNU General Public                //
// License as published by the Free Software Foundation;                     //
// either version 2 of the License, or (at your option) any                  //
// later version.                                                            //
//                                                                           //
// This program is distributed in the hope that it will be useful,           //
// but WITHOUT ANY WARRANTY; without even the implied warranty of            //
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the             //
// GNU General Public License for more details.                              //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Digestor = new Schema({
    name: { type: String, required: true, trim: true },
    type: { type: String, required: false, default: "REST" },
    version: {type: String, required: false},
    domain: {type: String, required: false},
    baseurl: {type: String, required: false},
    allowCrossDomain: {type: Boolean, default: false, required: false},
    logging: {type: Boolean, default: false, required: false},
    created: { type: Date, default: Date.now },
    lastUpdate: { type: Date, default: Date.now },
    lastAccess: { type: Date, default: Date.now },
    enabled: { type: Boolean, default: true, required: false },
    entries: { type: Array, required: false },
    hits: {type: Number, default: 0, required: false}
});

module.exports = mongoose.model('Digestor', Digestor);