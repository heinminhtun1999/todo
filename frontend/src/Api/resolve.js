const resolve = async (promise) => {
    const resolved = {
        data: null,
        error: null
    }

    try {
        const res = await promise();
        resolved.data = res.data;
    } catch (e) {
        resolved.error = { message: e.response.data, status: e.response.status }
    }

    return resolved;
};

export default resolve;