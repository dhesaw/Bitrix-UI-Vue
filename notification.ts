import {ref} from "vue";

class BxNotification {
    
    private static instance: BxNotification;
    notifications=ref<INotification[]>([]);
    private constructor() {
    }

    public static getInstance(): BxNotification {
        if (!BxNotification.instance) {
            BxNotification.instance = new BxNotification();
        }
        return BxNotification.instance;
    }

    public addNotification(notify:INotification){
        if (Array.isArray(notify.MESSAGE)) notify.MESSAGE=notify.MESSAGE.join(',');
        this.notifications.value.push(notify);
        if(notify.DURATION){
            setTimeout(() => {
                this.removeNotification(notify);
            }, notify.DURATION);
        }
    
    }
    
    public removeNotification(notify:INotification){
        this.notifications.value=this.notifications.value.filter(item=>item.MESSAGE!=notify.MESSAGE);
    }
}

export const useNotification = () => BxNotification.getInstance();

export interface INotification {
    'MESSAGE': string,
    'TYPE'?: string,
    'DURATION'?: number|null
}