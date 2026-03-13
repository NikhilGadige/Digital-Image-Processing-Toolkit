import ModulePage from '../ModulePage';
import ColorModelSimulator from '../../components/ColorModelSimulator';

function Chapter6Page() {
  return (
    <ModulePage
      forcedModuleId="color-image-processing"
      chapterContext="Chapter 6 module page: color models, transformations, segmentation, and color enhancement."
      extraSection={<ColorModelSimulator />}
    />
  );
}

export default Chapter6Page;
