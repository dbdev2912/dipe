export default ( props ) => {
    const { field, changeTrigger } = props;
    const fieldChangeData = (e) => {
        const { value } = e.target
        changeTrigger( field, value )
    }

    return(
        <div className="w-100-pct p-1 m-t-1">
            <div>
                <span className="block text-16-px">{ field.field_name }</span>
            </div>
            <div className="m-t-0-5">
                <input type="text"
                    className="p-t-0-5 p-b-0-5 p-l-1 text-16-px block w-100-pct border-1"
                    placeholder="" onChange={ fieldChangeData }
                    />
            </div>
        </div>
    )
}
