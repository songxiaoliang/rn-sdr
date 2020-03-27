import { Injectable } from '@nestjs/common';

@Injectable()
export class SdrService {

    /**
     * 获取templeate
     * @returns {*}
     * @memberof SdrService
     */
    getSdrTemplate(): any {
        return {
            type: 'View',
            props: {
                a: 1,
                style: {
                    width: 300,
                    height: 500,
                    marginTop: 30,
                    alignSelf: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#ff0'
                }
            },
            children: [
                {
                    type: 'View',
                    props: { 
                        style: {
                            width: 50, 
                            height: 50, 
                        } 
                    },
                    children: [
                        {
                            type: 'Text',
                            props: { 
                                style: {  
                                    fontSize: 16, 
                                    color: '#0f0fff'  
                                } 
                            },
                            children: '${text::test.username}'
                        }
                    ]
                },
                {
                    type: 'Image',
                    props: {
                        source: { uri: 'prop::test.icon' },
                        style: { width: 50, height: 50 }
                    }
                },
                {
                    type: "Button",
                    props: {
                        activeOpacity: 0.2,
                        
                        onPress: "function::test.onPress(${text::item.info.buttonName})",
                        style: {[ "prop::test.buttonStyle", { marginTop: 20 } ]}
                    },
                    children: [
                        {
                            type: 'Text',
                            props: { 
                                style: {  
                                    fontSize: 16, 
                                    color: '#fff'  
                                } 
                            },
                            children: '${text::test.username}'
                        }
                    ]
                }
            ]
        };
    }
}
