const express = require('express');
const router = express.Router();
const { Table } = require('../module/table');
const { connector } = require('../db/connector');
const fs = require('fs');

const partner = new Table('partner');

router.get('/', (req, res) => {
    // partner.selectAll((result) => {
    //     const ptr = result[0];
    //     res.send({ partner: ptr })
    // })

    connector(`CALL GET_PARTNER()`, (result) => {
        console.log(result);
        const ptr = result[0];
        res.send({ partner: ptr })
    })

})

router.post('/update', (req, res) => {
    const { partner } = req.body;

    if( partner.image_url ){
        const file = partner.image_url

        const base64 = file.split(';base64,')[1];
        const buffer = Buffer.from(base64, "base64");

        fs.unlink(`public/img/partner/icon.png`, () => {
            console.log("Unlinked partner logo!");
            fs.writeFile(`public/img/partner/icon.png`, buffer, {encoding: 'base64'}, () => {

                const { partner_name, address, hotline, email, fax } = partner;

                const query = `
                UPDATE PARTNER SET
                partner_name = "${partner_name}",
                address = "${address}",
                hotline = "${hotline}",
                email = "${email}",
                fax = "${fax}"
                `;
                connector(query, (result) => {
                    res.send({success: true})
                })
            })
        })

    }
    else{
        const { partner_name, address, hotline, email, fax } = partner;

        const query = `
            UPDATE PARTNER SET
            partner_name = "${partner_name}",
            address = "${address}",
            hotline = "${hotline}",
            email = "${email}",
            fax = "${fax}"
        `;
        connector(query, (result) => {
            res.send({success: true})
        })
    }
})

module.exports = {
    router
}
