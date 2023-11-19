import React, {FC} from "react";

type Props = {
    children: React.ReactNode
}
const MainLayout: FC<Props> = ({children}) => {
    return(
        <>
            {children}
        </>
    )
}

export default MainLayout;