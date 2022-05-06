import React from "react";

const ErrorFallback = (props) => {

    const { error, resetErrorBoundary } = props;

    return (
        <div role="alert">
            <p>Something went wrong:</p>
            <pre>{error.message}</pre>
            <button onClick={resetErrorBoundary}>Try again</button>
        </div>
    )
}

export default ErrorFallback;