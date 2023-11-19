import React, {FC} from "react";
import style from './Header.module.css';

type Props = {
    children?: React.ReactNode|null
}
const Header: FC<Props> = ({children = null}) => {
    return(
        <>
            <header className={style.header}>
                {children}
            </header>
        </>
    )
}

export default Header;