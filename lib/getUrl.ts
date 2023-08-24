import {storage} from '@/appwrite';
import { Image } from '@/typings';

const getUrl = async(image: Image) => {
    console.log(image);
    
    const url = storage.getFileView(image.bucketId, image.fileId);
    
    
    return url;
};

export default getUrl;



// My URL - 

// https://cloud.appwrite.io/v1/storage/buckets/64e4f3c4dd2ff60aa295/files/64e6a130b92e30e28426/preview?project=64e4e9439dfef4c702e4

// Expected - 

// https://cloud.appwrite.io/v1/storage/buckets/64e4f3c4dd2ff60aa295/files/64e6a130b92e30e28426/view?project=64e4e9439dfef4c702e4&mode=admin



