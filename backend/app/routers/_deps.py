from fastapi import HTTPException


def get_cv2():
    try:
        import cv2  # type: ignore

        return cv2
    except ModuleNotFoundError as exc:
        raise HTTPException(
            status_code=500,
            detail=(
                "OpenCV dependency missing in active Python interpreter. "
                "Run backend with project venv (`.\\start_backend.ps1`) or install with "
                "`python -m pip install opencv-python-headless`."
            ),
        ) from exc
