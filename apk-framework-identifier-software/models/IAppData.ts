export default interface IAppData {
    filename: string,
    frameworks: string[] | string,
    manifest?: any,
    dex_date?: string,
    apk_size?: number,
    pkg_name?: string,
    dex_date_year_only?: string,
    store_category?: string,
    permissions?: string[],
    permissionCount?: number
}
