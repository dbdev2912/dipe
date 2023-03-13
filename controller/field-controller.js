const { mysql } = require('../Connect/conect');
const ConstraintController = require('../controller/constraint-controller');
class FieldController {
    constructor( field_object ){
        const { field_id, field_name, field_alias, nullable, field_props, field_data_type, default_value } = field_object;

        this.field_id = field_id;
        this.field_name = field_name;
        this.field_alias = field_alias;
        this.nullable = nullable;
        this.field_props = field_props;
        this.field_data_type = field_data_type;
        this.default_value     = default_value;
    }

    get = () => {
        const { field_id, field_name, field_alias, nullable, field_props, field_data_type, default_value } = this;
        return { field_id, field_name, field_alias, nullable, field_props, field_data_type, default_value }
    }

    modify = ( { field_name, nullable, field_props, field_data_type, default_value }, callback ) => {
        const query = `
            CALL modify_field(${ this.field_id }, '${ field_name }', ${ nullable }, '${ field_data_type }', '${ JSON.stringify({ props: field_props }) }', '${ default_value }')
        `;

        mysql( query, (result) => {
            const { success, content } = result[0];
            if( success ){
                /* THIS MAY BE GONNA CAUSE SOME BUGS BUT NEVER MIND */
            }
            this.field_name = field_name;
            this.nullable = nullable;
            this.field_props = JSON.stringify(field_props);
            this.field_data_type = field_data_type;
            this.default_value = default_value;
            callback({ success, content, field: this })
        })
    }
    drop = ( callback ) => {
        const query = `
            CALL drop_field(${ this.field_id })
        `;
        mysql( query, (result) => {
            const { success, content } = result[0];
            callback({ success, content })
        })
    }

    createConstraint = ( {
        constraint_type,
        reference_on,
        check_fomular,
        check_on_field,
        default_check_value
        }, callback ) => {

        const query = `
            CALL add_constraint('${constraint_type}', ${ this.field_id }, '${ reference_on ? reference_on: -1 }', '${ check_fomular }', ${ check_on_field }, '${ default_check_value ? default_check_value: "NULL" }');
        `;
        // console.log(query)
        mysql( query, (result) => {
            const { success, content, id } = result[0][0];
            callback( { success, content, id } )
        })
    }

}
module.exports = { FieldController }
