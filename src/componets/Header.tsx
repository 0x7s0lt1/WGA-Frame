type Props = {
    setIsCursorOnNav: (value: boolean) => void
}
export default function Header({setIsCursorOnNav}: Props){
    return(
        <header
            className="header bg-wga-blue"
            onMouseEnter={() => setIsCursorOnNav(true)}
            onMouseLeave={() => setIsCursorOnNav(false)}
        />
    )
}