// import { pipeline } from '@xenova/transformers';
// class Vision {
//
//     protected detector: any = null;
//
//     async init(): Promise<void>{
//         this.detector = await pipeline('object-detection', 'Xenova/detr-resnet-50');
//     }
//
//     async detect(image: any): Promise<any> {
//        if(this.detector === null){
//            await this.init();
//            return await this.detect(image);
//        }
//        return this.detector(image);
//     };
//
// }
//
// export default Vision;