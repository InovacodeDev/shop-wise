declare module 'helmet' {
    import { RequestHandler } from 'express';
    function helmet(): RequestHandler;
    namespace helmet {}
    export default helmet;
}
declare module 'hpp' {
    import { RequestHandler } from 'express';
    function hpp(): RequestHandler;
    export default hpp;
}
