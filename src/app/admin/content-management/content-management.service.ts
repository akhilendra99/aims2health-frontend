import { Injectable } from '@angular/core';
import { createClient, Entry } from 'contentful';
import { environment } from '../../../environments/environment' ;

@Injectable({providedIn: 'root'})
export class ContentService {
    // private client = createClient({
    //     space: '7jdlgv831cq3',
    //     accessToken: '-eLj9g2PtBOVev_PjcYnx69HFR6_Va1S04UdCEEH-aY'
    // });

    private client = createClient({
        space: '1ekkwr5nyjkw',
        accessToken: 'hV1-78iFjhaROfH4ZqxrLRyX-25Etn5sVV59NpG9_wg'
    });


    constructor() {

    }

    getContents(query?: object): Promise<Entry<any>[]>{
        return this.client.getEntries(Object.assign({
            content_type: 'blogPost'
        }, query))
        .then(res => res.items);
    }

    getDocProfiles(query?: object): Promise<Entry<any>[]>{
        return this.client.getEntries(Object.assign({
            content_type: 'docsProfile'
        }, query))
        .then(res => res.items);
    }

    getDocProfile(contentId): Promise<Entry<any>>{
        return this.client.getEntries(Object.assign({
            content_type: 'docsProfile'
        }, {'sys.id': contentId}))
        .then(res => res.items[0]);
    }

    getHostProfiles(query?: object): Promise<Entry<any>[]>{
        return this.client.getEntries(Object.assign({
            content_type: 'hostProfile'
        }, query))
        .then(res => res.items);
    }

    getContent(contentId): Promise<Entry<any>>{
        return this.client.getEntries(Object.assign({
            content_type: 'blogPost'
        }, {'sys.id': contentId}))
        .then(res => res.items[0]);
    }
}