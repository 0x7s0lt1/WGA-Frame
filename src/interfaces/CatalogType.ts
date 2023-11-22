import CatalogItemType from "@/interfaces/CatalogItemType";

export enum CatalogTypeKeys {
    achitecture = "architecture",
    ceramis = "ceramis",
    furniture = "furniture",
    glassware = "glassware",
    graphics = "graphics",
    illumination = "illumination",
    metalwork = "metalwork",
    mosic = "mosic",
    painting = "painting",
    sculpture = "sculpture",
    stained_glass = "stained_glass",
    tapestry = "tapestry",
};

type CatalogType = {

    achitecture:    CatalogItemType[],
    ceramis:        CatalogItemType[],
    furniture:      CatalogItemType[],
    glassware:      CatalogItemType[],
    graphics:       CatalogItemType[],
    illumination:   CatalogItemType[],
    metalwork:      CatalogItemType[],
    mosic:          CatalogItemType[],
    painting:       CatalogItemType[],
    sculpture:      CatalogItemType[],
    stained_glass:  CatalogItemType[],
    tapestry:       CatalogItemType[],

}

export default CatalogType;