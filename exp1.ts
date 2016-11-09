/**
 * Created by Weicheng Huang on 2016/11/8.
 */
export class ST{
    static instance:ST = new ST();
    data:number;
    constructor(){
        this.data = 1;
    }
    public foo(){
        console.log("data" + this.data);
        this.data += 1;
    }
}