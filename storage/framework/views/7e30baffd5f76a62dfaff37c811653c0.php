<form action="<?php echo e(route('common.store')); ?>" method="POST" class="div__create_form">
    <?php echo csrf_field(); ?>
    <div class="div__create_block">
   <h1><span class="Jikharev">Уважаемый клиент,</span>   мы подготовили для Вас Общий бриф</h1>
        <p>Вам необходимо заполнить все поля. Чем больше мы получим информации, тем более точный результат мы сможем гарантировать!</p>
        <button type="submit">Создать бриф</button>
    </div>
</form>
<?php /**PATH C:\OSPanel\domains\dlk\resources\views\common\module\create.blade.php ENDPATH**/ ?>