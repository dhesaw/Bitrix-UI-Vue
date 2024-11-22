export enum ActionType {
    rowAction = 1,
    groupAction = 2,
    paginator = 3,
    dropdown = 4,
    calendar = 5
}

export enum PopupLocation{
    TOP=1,
    LEFT=2,
    RIGHT=3,
    BOTTOM=4,
    CENTER=5
}

export enum Fields{
    DATE='date',
    TEXT='text',
    NUMBER='number',
    DROPDOWN='select',
    SEARCH='search'
}

export interface IPosition{
    x: number,
    y: number
}

export interface IElementPopup{
    type: ActionType,
    target: HTMLElement,
    popupId: number,
    data?: Record<string, unknown> | null,
    position: IPosition,
    width?: number | null,
    style?: Record<string, unknown> | {},
    class?: Record<string, boolean>| {}
}
