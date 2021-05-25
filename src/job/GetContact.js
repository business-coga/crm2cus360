const axios = require('axios').default
const conn = require('./../model')

async function GetAllContact(){
    let count = 1
    let offset = 0
    let countLoop = 0
    let contactsCRM = []
    let contactsInsert = []

    while (count > 0 && countLoop < 100) {
        countLoop++
        const response = await axios({
            method: 'GET',
            url: `https://fa-eqbg-saasfaprod1.fa.ocs.oraclecloud.com/crmRestApi/resources/11.13.18.05/contacts`,
            auth: {
                username: 'cuongtv3@tnh-hotels.vn',
                password: 'Prod@1234',
            },
            params : {
                onlyData : true,
                fields: 'PartyId,PersonProfileId,PartyNumber,SourceSystem,SourceSystemReferenceValue,FirstName,LastName,ContactName,OwnerPartyNumber,OwnerEmailAddress,OwnerName,DateOfBirth,Gender,PartyStatus,PartyType,MobileContactPointType,MobileCountryCode,MobileNumber,FormattedMobileNumber,RawMobileNumber,EmailContactPointType,EmailAddress,CreatedBy,CreationDate,LastUpdateDate,LastUpdatedBy',
                limit: 500,
                offset : offset,
                q : 'SourceSystem!=customer_360'
            }
        })
        if(response.status == 200){
            count = response.data.count
            offset = offset + count
            contactsCRM = contactsCRM.concat(response.data.items)
            console.log(countLoop)


        }else{
            console.log(`${(new Date()).toLocaleString()} ${JSON.stringify({
                status: response.status,
                statusText: response.statusText
            })}`)
        }
    }
    let partyId360  = (await conn.query(query.getPartyId())).rows

    for(let i=0; i < contactsCRM.length; i++){
        if(partyId360.find(e => e.partyid == contactsCRM[i].PartyId) === undefined){
            contactsInsert.push(contactsCRM[i])
        }
    }

    for(let i =0; i< contactsInsert.length; i++){
        const {rows} = await conn.query(query.insertContract(contactsInsert[i]))
    }

    console.log(`${(new Date()).toLocaleString()} Inserted : ${contactsInsert.length} contact.`)
}



const query = {
    truncateTableContract : function(){
        return `TRUNCATE staging_crm.contact`
    },
    getPartyId : function(){
        return `SELECT partyid
        FROM staging_crm.contact`
    },
    insertContract : function (data){
        return {
                text: `INSERT INTO staging_crm.contact(
                    partyid, --1
                    personprofileid,
                    partynumber,  --3
                    sourcesystem, 
                    sourcesystemreferencevalue,  --5
                    firstname, 
                    lastname, --7
                    contactname, 
                    ownerpartynumber, --9
                    owneremailaddress, 
                    ownername, --11
                    dateofbirth, 
                    gender, --13
                    partystatus, 
                    partytype, --15
                    mobilecontactpointtype, 
                    mobilecountrycode, --17
                    mobilenumber, 
                    formattedmobilenumber, --19
                    rawmobilenumber, 
                    emailcontactpointtype, --21
                    emailaddress,
                    createdby,
                    creationdate,
                    lastupdatedby,
                    lastupdatedate
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26) RETURNING *`,
                values: [`${data.PartyId}`, //1
                `${data.PersonProfileId}`, 
                `${data.PartyNumber}`, //3
                `${data.SourceSystem}`,
                `${data.SourceSystemReferenceValue}`, //5
                `${data.FirstName}`,
                `${data.LastName}`, //7
                `${data.ContactName}`, 
                `${data.OwnerPartyNumber}`, //9
                `${data.OwnerEmailAddress}`,
                `${data.OwnerName}`, //11
                `${data.DateOfBirth}`,
                `${data.Gender}`, //13
                `${data.PartyStatus}`, 
                `${data.PartyType}`, //15
                `${data.MobileContactPointType}`,
                `${data.MobileCountryCode}`, //17
                `${data.MobileNumber}`, 
                `${data.FormattedMobileNumber}`, //19
                `${data.RawMobileNumber}`, 
                `${data.EmailContactPointType}`, //21
                `${data.EmailAddress}`,
                `${data.CreatedBy}`,
                `${data.CreationDate}`,
                `${data.LastUpdatedBy}`,
                `${data.LastUpdateDate}`,
            
            ],
            }
    }
}

module.exports = function (){
    GetAllContact().catch(err => console.log(err))
}