const { mysql } = require('../Connect/conect');

class ConstraintController {
    constructor( constraint ){
        const { constraint_id,
                constraint_type,
                field_id, // field controller object
                reference_on,  //field controller object
                check_fomular,
                check_on_field,
                default_check_value
            } = constraint;

            this.constraint_id = constraint_id;
            this.constraint_type = constraint_type;
            this.field_id = field_id;
            this.reference_on = reference_on;
            this.check_fomular = check_fomular;
            this.check_on_field = check_on_field;
            this.default_check_value = default_check_value;
    }
    get = () => {
        const { constraint_id,
                constraint_type,
                field_id,
                reference_on,
                check_fomular,
                check_on_field,
                default_check_value
            } = this
        return { constraint_id, constraint_type, field_id, reference_on, check_fomular, check_on_field, default_check_value };
    }
    modify = ( { constraint_type, field_id, reference_on, check_fomular, check_on_field, default_check_value }, callback ) => {
        const query = `
            CALL modify_constraint(${ this.constraint_id }, '${constraint_type}', ${ field_id }, '${ reference_on ? reference_on: -1 }', '${ check_fomular }', ${ check_on_field }, '${ default_check_value ? default_check_value: "NULL" }');
        `
        /* CHECK IF DATA TYPE AND DATA PROPS BETWEEN THEM ARE THE SAME */
        /* ENSURE THE FIELD_ID MUST BE ON THE PARENT TABLE */
        mysql( query, result => {
            const { success, content } = result[0];
            if( success ){
                this.constraint_type = constraint_type;
                this.field_id = field_id;
                this.reference_on = reference_on;
                this.check_fomular = check_fomular;
                this.check_on_field = check_on_field;
                this.default_check_value = default_check_value;
                callback({ success, content , constraint: this});
            }
            else{
                callback({ success, content, constraint: this });
            }

        })
    }
    drop = (callback) => {
        const query = `
            CALL drop_constraint(${ this.constraint_id })
        `
        mysql( query, result => {
            callback(result[0][0]);
        })
    }

    getFieldAlias = ( callback ) => {
        const query = `
            SELECT field_alias FROM fields WHERE field_id = ${ this.field_id }
        `;
        mysql( query, result => {
            if( result.length > 0 ){
                const { field_alias } = result[0];
                callback({ success: true, field_alias })
            }else{
                callback({ success: false })
            }
        })
    }
}
module.exports = { ConstraintController }
