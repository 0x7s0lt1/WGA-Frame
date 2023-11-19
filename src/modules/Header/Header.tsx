import React, {FC} from "react";

type Props = {
    children?: React.ReactNode|null
}
const Header: FC<Props> = ({children = null}) => {
    return(
        <>
            <header className="header">
                {children}
            </header>
        </>
    )
}

export default Header;