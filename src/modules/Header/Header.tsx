import {FC} from "react";

type Props = {
    isCursorOnNav: boolean
    setIsCursorOnNav: (value: boolean) => void
}
const Header: FC<Props> = ({
                        isCursorOnNav,
                        setIsCursorOnNav
                    }) => {
    return(
        <header
            className="header"
            onMouseEnter={() => setIsCursorOnNav(true)}
            onMouseLeave={() => setIsCursorOnNav(false)}
        >

        </header>
    )
}

export default Header;