(() => {
    var gender_detection_cache;

    function Save(data) {
        gender_detection_cache = data;
        localStorage.gender_detection = JSON.stringify(data);
    }

    function Get() {
        try {
            if (!!gender_detection_cache) return gender_detection_cache;

            const data = JSON.parse(localStorage.gender_detection);
            gender_detection_cache = data;

            return data;
        } catch {
            return {};
        }
    }

    window.GetGenderByName = (name) => {
        return new Promise((resolve, reject) => {
            name = retira_acentos(name.split(" ")[0]);

            const cached = Get()[name];

            if (!!cached) return resolve(cached);

            fetch(`https://api.genderize.io/?name=${decodeURIComponent(name)}`).then(res => res.json()).then(data => {
                resolve(data?.gender);

                const cached_data = Get();

                cached_data[name] = data?.gender;

                Save(cached_data);
            }).catch(reject)
        });
    }

    function retira_acentos(str) {
        const com_acento = "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝŔÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿŕ";
        const sem_acento = "AAAAAAACEEEEIIIIDNOOOOOOUUUUYRsBaaaaaaaceeeeiiiionoooooouuuuybyr";
        let new_string = "";

        for (i = 0; i < str.length; i++) {
            let troca = false;
            for (a = 0; a < com_acento.length; a++) {
                if (str.substr(i, 1) == com_acento.substr(a, 1)) {
                    new_string += sem_acento.substr(a, 1);
                    troca = true;
                    break;
                }
            }
            if (troca == false) {
                new_string += str.substr(i, 1);
            }
        }

        return new_string;
    }
})();