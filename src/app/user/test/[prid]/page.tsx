"use client";

import { useParams } from "next/navigation";

function Page() {
    const { prid } = useParams()
    return <p>Showing as {prid}</p>
}

export default Page;