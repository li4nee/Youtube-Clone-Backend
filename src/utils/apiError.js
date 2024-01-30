class apiError extends Error
{
    constructor(
        statusCode,
        message="Something went wrong",
        errors=[]
    ){
        super(message);
        this.statusCode=statusCode;
        this.data=null;
        this.message=message;
        this.success=false;
        this.errors=errors;
    }
}

function generateErrorResponse(statusCode, message, errors = []) {
    return new apiError(statusCode, message, errors);
}
export {generateErrorResponse};